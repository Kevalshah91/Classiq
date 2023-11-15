import cv2
import numpy as np
import mediapipe as mp
import time

mp_drawing=mp.solutions.drawing_utils
mp_selfie_segmentation=mp.solutions.selfie_segmentation

video=cv2.VideoCapture(0)
fps = video.get(5)
capture_interval = 1
start_time = time.time()
x=0
print("FrameRate: ",fps)

#Whiteboard Top left coordinate and bottom right coordinate
a,b=20,15
c,d=600,430
with mp_selfie_segmentation.SelfieSegmentation(model_selection=0) as selfie_segmentation:
    while video.isOpened():
        ret,frame=video.read()
        if not ret:
            print("Empty camera frame")
            break
        
        #Hough Lines Transformation for finding board
        # lines=cv2.HoughLinesP(edge,1,np.pi/180,50,maxLineGap=350,minLineLength=100)
        # for line in lines:
        #     x1,y1,x2,y2=line[0]
        #     cv2.line(frame,(x1,y1),(x2,y2),(0,0,255),2)
        
        #Cropping whiteboard
        cv2.rectangle(frame,(a,b),(c,d),(0,255,0),2)
        crop = frame[b+2:d-2,a+2:c-2]
        crop_nomask=crop.copy()
        
        #ML model to find body
        image=cv2.cvtColor(crop,cv2.COLOR_BGR2RGB)
        image.flags.writeable=False
        results=selfie_segmentation.process(image)
        image.flags.writeable=True
        image=cv2.cvtColor(image,cv2.COLOR_RGB2BGR)
        condition=np.stack((results.segmentation_mask,)*3,axis=-1)>0.25

        #Mask for body
        mask = np.zeros_like(results.segmentation_mask)
        mask[results.segmentation_mask > 0.1] = 255
        mask = mask.astype(np.uint8)
        _, mask = cv2.threshold(mask, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        #Dilation of mask
        kernel1 = np.ones((4,4), np.uint8)
        mask=cv2.dilate(mask,kernel1,iterations=1)
        crop[mask == 255] = (255, 255,255)
        
        #Whiteboard content
        gray=cv2.cvtColor(crop_nomask,cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(src=gray, ksize=(3, 5), sigmaX=0.5)
        edge = cv2.Canny(blurred, 50,135)
        edge[mask == 255] = 0

        #Dilation of board contents
        kernel2 = np.ones((2,2), np.uint8)
        pic=cv2.dilate(edge,kernel2,iterations=1)
        pic_inv=cv2.bitwise_not(pic)
        
        #Transparent Background
        h, w = pic_inv.shape
        pic_t = np.zeros((h, w, 4), dtype=np.uint8)
        pic_t[:, :, 0] = pic_inv
        pic_t[:, :, 1] = pic_inv
        pic_t[:, :, 2] = pic_inv
        pic_t[:, :, 3] = 255 - pic_inv 
        
        #Saving images (SuperImposing with previous images)
        elapsed_time = time.time() - start_time
        if elapsed_time >= capture_interval:
            if x==0:    
                filename = f"E:/code/Projects/Whiteboard/pictures/image_{int(x)}.png"
                cv2.imwrite(filename,pic_t)
            if x>0:
                prev_img=cv2.imread(f"E:/code/Projects/Whiteboard/pictures/image_{int(x)-1}.png", cv2.IMREAD_UNCHANGED)
                result = np.where(pic_t[:, :, 3][:, :, np.newaxis] > 0, pic_t, prev_img)
                filename = f"E:/code/Projects/Whiteboard/pictures/image_{int(x)}.png"
                cv2.imwrite(filename,result)
            x += 1
            start_time = time.time()
        
        cv2.imshow("Crop",crop)   
        cv2.imshow("Board",pic_t)
        k=cv2.waitKey(1)
        if k==ord('q'):
            break

video.release()
cv2.destroyAllWindows()
