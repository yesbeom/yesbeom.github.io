"""로컬 개발 서버 (HTTP Range 지원).

python -m http.server는 Range 요청을 지원하지 않아 <video> 시킹(재생바 이동)이
동작하지 않는다. 이 서버는 206 Partial Content로 응답해 영상 시킹을 지원한다.

사용법:  python scripts/serve.py  →  http://localhost:8000
"""

import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class RangeHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        range_header = self.headers.get("Range")
        if not range_header or not os.path.isfile(path):
            return super().send_head()

        match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if not match:
            return super().send_head()

        size = os.path.getsize(path)
        start = int(match.group(1))
        end = int(match.group(2)) if match.group(2) else size - 1
        end = min(end, size - 1)
        if start >= size:
            self.send_error(416)
            return None

        f = open(path, "rb")
        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self._range_remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining > 0:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    os.chdir(ROOT)
    print(f"Serving {ROOT} at http://localhost:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), RangeHandler).serve_forever()
