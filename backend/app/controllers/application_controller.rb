class ApplicationController < ActionController::API
  include Authentication

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: e.message }, status: :bad_request
  end
end
