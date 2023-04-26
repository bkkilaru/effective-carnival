---
title: Building a Chatbot with Python and the Facebook Messenger API
brief: Chatbots are becoming increasingly popular as a way for businesses to engage with customers and automate certain tasks. In this blog post, we will explore how to build a chatbot using Python and the Facebook Messenger API.
heroImage: https://res.cloudinary.com/dmffaoohj/image/upload/v1680611513/header-image_rtkzog.png
readTimeInMinutes: 4
createdAt: 2023-04-03
author: john-smith
---

Chatbots are becoming increasingly popular as a way for businesses to engage with customers and automate certain tasks. In this tutorial, we will explore how to build a chatbot using Python and the Facebook Messenger API.

## Prerequisites

Before we get started, you'll need to have the following:

- A Facebook account
- A Facebook page (you can create one if you don't have one already)
- Python 3.x installed on your computer
- The Flask and Requests libraries for Python (you can install them using pip)

> Note: This tutorial assumes that you have some basic knowledge of Python and the command line.

## Step 1: Set up a Facebook page and app

To use the Facebook Messenger API, you'll need to set up a Facebook page and app. Follow these steps to get started:

1. Go to the Facebook for Developers website and create a new app.
2. Set up a webhook for your app that will receive messages sent to your page.
3. Create a Facebook page or link your app to an existing page.

## Step 2: Create a Python script

Now that we have our Facebook page and app set up, we can start writing our Python script. Here's an example script that you can use:

```python
from flask import Flask, request
import requests

app = Flask(__name__)

VERIFY_TOKEN = 'your_verify_token_here'
PAGE_ACCESS_TOKEN = 'your_page_access_token_here'

@app.route('/', methods=['GET', 'POST'])
def receive_message():
    if request.method == 'GET':
        # Facebook will send a verification token in the query parameters
        token_sent = request.args.get('hub.verify_token')
        return verify_fb_token(token_sent)
    else:
        # If the request was not a GET request, it must be a POST request
        # We'll extract the message and sender ID from the JSON data
        output = request.get_json()
        for event in output['entry']:
            messaging = event['messaging']
            for message in messaging:
                if message.get('message'):
                    recipient_id = message['sender']['id']
                    message_text = message['message']['text']
                    send_message(recipient_id, message_text)
        return "Message Processed"

def verify_fb_token(token_sent):
    if token_sent == VERIFY_TOKEN:
        return request.args.get("hub.challenge")
    else:
        return 'Invalid verification token'

def send_message(recipient_id, message_text):
    headers = {'Content-Type': 'application/json'}
    data = {
        'recipient': {'id': recipient_id},
        'message': {'text': message_text}
    }
    params = {'access_token': PAGE_ACCESS_TOKEN}
    r = requests.post('https://graph.facebook.com/v12.0/me/messages', headers=headers, params=params, json=data)

if __name__ == '__main__':
    app.run(debug=True)
```

## Step 3: Run the script

Now that we have our script, we can run it. To do this, we'll use the Flask development server. To run the script, open a terminal window and run the following command:

```bash
python3 script.py
```

## Step 4: Test the script

Now that we have our script running, we can test it. To do this, we'll use the Facebook Developer Console. To test the script, follow these steps:

1. Go to the Facebook Developer Console and select your app.
2. Go to the Messenger section and select the webhook.
3. Send a message to your Facebook page and check the terminal window to see if the message was received.

## Conclusion

In this tutorial, we explored how to build a chatbot using Python and the Facebook Messenger API. We also learned how to set up a Facebook page and app. If you have any questions, feel free to leave a comment below.

## Resources

- [Facebook for Developers](https://developers.facebook.com/)
- [Facebook Developer Console](https://developers.facebook.com/apps/)
- [Flask](https://flask.palletsprojects.com/en/2.0.x/)

## ChatGPT

This post was generated by [ChatGPT](https://chatgpt.com/) and is an example of how you can create your own blog posts with Scalerepo.