import boto3
import requests
import time
import io

now = int(time.time())
file_name = f"monitor/{now}.json"

# This IP may need to be changed on some models?
url = "http://172.27.153.1/cgi-bin/dl_cgi?Command=DeviceList"

print("Time: " + str(now))

s3 = boto3.client(
    service_name ="s3",
    endpoint_url = 'https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com',
    aws_access_key_id = '<YOUR_ACCESS_KEY_ID>',
    aws_secret_access_key = '<YOUR_SECRET_KEY>',
    region_name="auto"
)

print("Fetching monitor status")
res = requests.get(url)
file_content = res.text
print(file_content)

# Assuming your bucket is named "solarmon"
s3.upload_fileobj(io.BytesIO(file_content.encode()), "solarmon", file_name)
print("Uploaded")
