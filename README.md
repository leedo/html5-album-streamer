In order to get this working locally you need to run app.psgi, or any other
HTTP proxy at the /playlist path.

To get all the dependencies for the proxy run the following commands:

    curl -L http://cpanmin.us | perl - --sudo App::cpanminus
    cpanm --sudo Twiggy Plack::App::Proxy

Then you can run the appication in this respository's root directory

    plackup app.psgi
