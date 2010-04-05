use Plack::Builder;
use Plack::App::Proxy;
use Plack::Request;

my $proxy = Plack::App::Proxy->new->to_app;

builder {
  enable "Static", path => qr{^/js/}, root => "./";
  mount "/" => Plack::App::File->new(file => "index.html");
  mount "/playlist" => sub {
    my $req = Plack::Request->new(shift);
    if (my $url = $req->param("url")) {
      $req->env->{'plack.proxy.url'} = $url;
      return $proxy->($req->env);
    }
    else {
      return [404, [], ['not found']];
    }
  };
}
