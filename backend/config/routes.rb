Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "auth/register", to: "registrations#create"
      post "auth/login", to: "sessions#create"
      delete "auth/logout", to: "sessions#destroy"
      get "me", to: "users#me"
    end
  end
end
