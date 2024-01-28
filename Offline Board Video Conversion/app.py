from flask import Flask, render_template, Response
import cv2
import numpy as np
import mediapipe as mp

app = Flask(__name__)
camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
            
def generate_board():
    mp_drawing = mp.solutions.drawing_utils
    mp_selfie_segmentation = mp.solutions.selfie_segmentation

    video = cv2.VideoCapture(0)

    while video.isOpened():
        ret, frame = video.read()

        if not ret:
            break
        else:
            a, b = 0, 0
            c, d = 640, 480
            with mp_selfie_segmentation.SelfieSegmentation(model_selection=0) as selfie_segmentation:
                while video.isOpened():
                    ret, frame = video.read()
                    if not ret:
                        print("Empty camera frame")
                        break

                    # Cropping whiteboard
                    cv2.rectangle(frame, (a, b), (c, d), (0, 255, 0), 2)
                    crop = frame[b + 2 : d - 2, a + 2 : c - 2]
                    crop_nomask = crop.copy()

                    # ML model to find body
                    image = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                    image.flags.writeable = False
                    results = selfie_segmentation.process(image)
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                    condition = np.stack((results.segmentation_mask,) * 3, axis=-1) > 0.25

                    # Mask for body
                    mask = np.zeros_like(results.segmentation_mask)
                    mask[results.segmentation_mask > 0.1] = 255
                    mask = mask.astype(np.uint8)
                    _, mask = cv2.threshold(mask, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

                    # Dilation of mask
                    kernel1 = np.ones((6, 6), np.uint8)
                    mask = cv2.dilate(mask, kernel1, iterations=1)
                    crop[mask == 255] = (255, 255, 255)

                    # Whiteboard content
                    gray = cv2.cvtColor(crop_nomask, cv2.COLOR_BGR2GRAY)
                    blurred = cv2.GaussianBlur(src=gray, ksize=(3, 5), sigmaX=0.5)
                    edge = cv2.Canny(blurred, 50, 135)
                    edge[mask == 255] = 0

                    # Dilation of board contents
                    kernel2 = np.ones((2, 2), np.uint8)
                    pic = cv2.dilate(edge, kernel2, iterations=1)
                    pic_inv = cv2.bitwise_not(pic)

                    # Transparent Background
                    h, w = pic_inv.shape
                    pic_t = np.zeros((h, w, 4), dtype=np.uint8)
                    pic_t[:, :, 0] = pic_inv
                    pic_t[:, :, 1] = pic_inv
                    pic_t[:, :, 2] = pic_inv
                    pic_t[:, :, 3] = 255 - pic_inv

                    board = pic_t

                    ret, buffer = cv2.imencode('.jpg', board)
                    frame = buffer.tobytes()

                    yield (
                        b'--frame\r\n'
                        b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n'
                    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed_board')
def video_feed_board():
    return Response(generate_board(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True,host='localhost', port=4000)
