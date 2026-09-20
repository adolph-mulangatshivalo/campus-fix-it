import sys
text = open(sys.argv[1]).read()
text = text.replace('pick 7a031dc', 'reword 7a031dc')
open(sys.argv[1], 'w').write(text)
