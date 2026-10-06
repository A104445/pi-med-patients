# A app móvel nativa não está sujeita a CORS, mas permitimos pedidos de
# origens web (ex.: `expo start --web`) em desenvolvimento.
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("CORS_ORIGINS", "localhost:8081").split(",")

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
