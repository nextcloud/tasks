VERSION=1.2.2
NAME=jquery.timepicker-${VERSION}

SOURCES=${NAME}.js ${NAME}.css
COMPRESSED=${NAME}.min.js ${NAME}.min.css
MISC=AUTHORS CHANGELOG GPL-LICENSE.txt MIT-LICENSE.txt README.md

FILES=${SOURCES} ${COMPRESSED} ${MISC}

BUILD=builds/jquery-timepicker-${VERSION}.zip


build: ${NAME}.js ${NAME}.css
	cp jquery.timepicker.js ${NAME}.js
	cp jquery.timepicker.css ${NAME}.css
	mkdir -p `dirname ${BUILD}`
	zip ${BUILD} ${FILES}

${NAME}.js:
	curl -d compilation_level=WHITESPACE_ONLY \
	     -d output_format=text \
	     -d output_info=compiled_code \
	     --data-urlencode js_code@jquery.timepicker.js \
	     http://closure-compiler.appspot.com/compile > jquery.timepicker.min.js
	cp jquery.timepicker.min.js jquery.timepicker-${VERSION}.min.js

${NAME}.css:
	curl http://mabblog.com/cssoptimizer/service.php \
		 -F "data=<jquery.timepicker.css" > jquery.timepicker.min.css
	cp jquery.timepicker.min.css jquery.timepicker-${VERSION}.min.css

clean:
	rm ${SOURCES} ${COMPRESSED}
