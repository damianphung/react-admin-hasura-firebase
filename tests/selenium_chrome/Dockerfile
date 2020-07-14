FROM python:3.8

# install google chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get -yqq update
RUN apt-get -yqq install google-chrome-stable

# install chromedriver
RUN apt-get -yqq install unzip
RUN wget --quiet -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE`/chromedriver_linux64.zip
RUN unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/
RUN rm /tmp/chromedriver.zip

# set display port to avoid crash
ENV DISPLAY=:99

# upgrade pip
RUN pip install --upgrade pip

# install selenium
RUN pip install selenium

# Copy test scripts over
RUN mkdir /usr/bin/my_tests
COPY tests/ /usr/bin/my_tests/

# Run tests (make test_script.py call the subtests)
CMD ["python","/usr/bin/my_tests/test_script.py"]