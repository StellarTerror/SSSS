FROM ruby:2.5.8-stretch

RUN wget https://www.python.org/ftp/python/3.6.1/Python-3.6.1.tgz && \
  tar zxvf Python-3.6.1.tgz && \
  cd Python-3.6.1 && \
  ./configure --prefix=/usr/local/python && \
  make && make install && \
  ln -s /usr/local/python/bin/python3.6 /usr/local/bin/python && \
  ln -s /usr/local/python/bin/pip3.6 /usr/local/bin/pip && \
  pip install --upgrade pip && \
  pip install amplify

# RUN apt-get update -qq && apt-get install -y build-essential
# RUN mkdir /SSSS
# WORKDIR /SSSS
# ADD rails/sources/SSSS /SSSS
# RUN gem install bundler -v 1.3.0
# RUN bundle install
