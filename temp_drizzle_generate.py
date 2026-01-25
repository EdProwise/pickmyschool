import subprocess
import sys
import time

command = ' '.join(sys.argv[1:]) or 'npx drizzle-kit generate'
process = subprocess.Popen(command, shell=True, stdin=subprocess.PIPE, text=True)
for _ in range(40):
    time.sleep(0.5)
    if process.poll() is not None:
        break
    try:
        process.stdin.write('\n')
        process.stdin.flush()
    except (BrokenPipeError, ValueError):
        break
exit_code = process.wait()
sys.exit(exit_code)
