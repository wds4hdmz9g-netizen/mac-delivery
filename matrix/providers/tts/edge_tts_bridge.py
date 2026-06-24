"""
EdgeTTS Python 桥接脚本 v2
接收 JSON 文件路径，输出 MP3
因为 edge-tts CLI 与 Python 3.13 不兼容，改用 Python API 直调
"""
import sys, json, asyncio, os
import edge_tts

async def synthesize(voice, rate, pitch, text, output):
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
        pitch=pitch,
    )
    await communicate.save(output)
    size = os.path.getsize(output)
    return size

async def main():
    try:
        input_file = sys.argv[1]
        with open(input_file, 'r', encoding='utf-8-sig') as f:
            input_data = json.load(f)
        size = await synthesize(
            voice=input_data['voice'],
            rate=input_data.get('rate', '+0%'),
            pitch=input_data.get('pitch', '+0Hz'),
            text=input_data['text'],
            output=input_data['output']
        )
        print(json.dumps({"ok": True, "size": size, "output": input_data['output']}))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
