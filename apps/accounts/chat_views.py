import os
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import urllib.request
import urllib.error
import json

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

SYSTEM_PROMPT = """You are Transit Trust Assistant, a helpful AI for the Transit Trust public transport system in Bangladesh.

Your main focus is helping users with:
- Bus fares and routes in Bangladesh
- Overcharge reporting guidance
- Safety tips for public transport
- How to use the Transit Trust app
- General transport-related questions in Bangladesh

You can also answer general questions on any topic. Be friendly, concise, and helpful. When discussing fares, mention that the official BRTA rate is Tk 2.42 per km. Always respond in the same language the user writes in (Bengali or English)."""


@api_view(['POST'])
def chat(request):
    messages = request.data.get('messages', [])
    if not messages:
        return Response({'error': 'No messages provided.'}, status=status.HTTP_400_BAD_REQUEST)

    groq_messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    for m in messages:
        groq_messages.append({'role': m['role'], 'content': m['content']})

    payload = json.dumps({
        'model':       'llama-3.3-70b-versatile',
        'messages':    groq_messages,
        'max_tokens':  1000,
        'temperature': 0.7,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions',
        data=payload,
        headers={
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + GROQ_API_KEY,
            'User-Agent':    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as res:
            data  = json.loads(res.read().decode('utf-8'))
            reply = data['choices'][0]['message']['content']
            return Response({'reply': reply})
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print("HTTPError:", e.code, body)
        return Response({'error': 'HTTP ' + str(e.code) + ': ' + body}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except urllib.error.URLError as e:
        print("URLError:", str(e.reason))
        return Response({'error': 'URL error: ' + str(e.reason)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        print("Exception:", str(e))
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
