module Authentication
  extend ActiveSupport::Concern
  include ActionController::HttpAuthentication::Token::ControllerMethods

  included do
    before_action :require_authentication
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private

  def current_session
    @current_session
  end

  def current_user
    current_session&.user
  end

  def require_authentication
    @current_session = authenticate_with_http_token { |token, _| Session.find_by_token(token) }
    return render_unauthorized unless @current_session

    @current_session.touch_last_used!
  end

  def start_session_for(user)
    user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip)
  end

  def render_unauthorized
    render json: { error: "Não autenticado" }, status: :unauthorized
  end
end
