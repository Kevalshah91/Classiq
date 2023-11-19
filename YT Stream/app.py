#pip install google-auth
#pip install datetme
#pip install pytz
#pip install google-api-python-client
#pip install flask

from flask import Flask, render_template, request, jsonify
import threading
import cv2
import datetime
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from dateutil import tz
import pytz
from googleapiclient.errors import HttpError

app = Flask(__name__)

# Set up the necessary scopes for YouTube Live Streaming API
SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

# Authenticate and build the service
def authenticate():
    flow = InstalledAppFlow.from_client_secrets_file("E:\code\Projects\Whiteboard\client_secrets.json", SCOPES)
    credentials = flow.run_local_server(port=0)
    return build("youtube", "v3", credentials=credentials)

# Start streaming
def start_stream(youtube, stream_key):
    now = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ") # Current time
    
   
    ist = pytz.timezone('Asia/Kolkata')
    local_tz = datetime.datetime.now(ist)
    # Replace 'Your Local Timezone' with your actual timezone
    utc_time = local_tz.astimezone(pytz.utc)
    scheduled_time_for_youtube = (utc_time).isoformat()
    actual_time_for_youtube=(utc_time+datetime.timedelta(minutes=1)).isoformat()
    
    # Create a liveBroadcast resource3
    live_broadcast = youtube.liveBroadcasts().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": "Test",
                "description": "Description",
                "scheduledStartTime": scheduled_time_for_youtube,
                "actualStartTime":actual_time_for_youtube
            },
            "status": {
                "privacyStatus": "public",  # or "private" or "unlisted"
                "selfDeclaredMadeForKids":"false"
            }
        }
    ).execute()

    # Create a liveStream resource
    live_stream = youtube.liveStreams().insert(
        part="snippet,cdn",
        body={
            "snippet": {
                "title": "Stream Test"
            },
            "cdn": {
                "format": "1080p",
                "resolution":"1080p",
                "frameRate": "60fps",
                "ingestionType": "rtmp",
                "ingestionInfo": {
                    "streamName": stream_key
                }
            }
        }
    ).execute()

    # Bind the broadcast to the stream
    youtube.liveBroadcasts().bind(
        part="id,contentDetails",
        id=live_broadcast["id"],
        streamId=live_stream["id"]
    ).execute()

    # Begin streaming with OpenCV VideoCapture
    cap = cv2.VideoCapture(0)  # Use appropriate video source

    # Define the codec and create VideoWriter object
    #out = cv2.VideoWriter('appsrc ! videoconvert ! x264enc tune=zerolatency bitrate=500 speed-preset=superfast ! flvmux ! rtmpsink location=rtmp://a.rtmp.youtube.com/live2/41c5-qu0u-7my0-f1q0-4ea0', cv2.CAP_GSTREAMER, 30, (1920, 1080))
    fourcc = cv2.VideoWriter_fourcc(*'X264')  # Choose an appropriate codec
    out = cv2.VideoWriter('appsrc ! videoconvert ! x264enc tune=zerolatency bitrate=500 speed-preset=superfast ! flvmux ! rtmpsink location=rtmp://a.rtmp.youtube.com:443/live2/' + stream_key, fourcc, 20.0,(1920,1080))  # Adjust resolution and framerate

    
    while True:
        ret, frame = cap.read()

        # Process the frame if needed

        # Write the frame
        out.write(frame)

        # Display the frame locally
        # cv2.imshow('frame', frame)
        # if cv2.waitKey(1) & 0xFF == ord('q'):
        #     break

    # cap.release()
    out.release()
    cv2.destroyAllWindows()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start_stream", methods=["POST"])
def start_stream_route():
    stream_key = request.form.get("streamKey")
    youtube_service = authenticate()

    try:
        threading.Thread(target=start_stream, args=(youtube_service, stream_key)).start()
        return jsonify({"success": True, "message": "Streaming started successfully!"})
    except HttpError as e:
        return jsonify({"success": False, "message": f"An HTTP error {e.resp.status} occurred:\n{e.content}"})

if __name__ == "__main__":
    app.run(debug=True)
