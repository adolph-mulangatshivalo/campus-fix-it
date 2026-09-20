import os, subprocess, sys
env = os.environ.copy()
env['GIT_SEQUENCE_EDITOR'] = 'python reword_seq.py'
env['GIT_EDITOR'] = 'python reword_msg.py'
subprocess.run(['git', 'rebase', '-i', '--root'], env=env)
