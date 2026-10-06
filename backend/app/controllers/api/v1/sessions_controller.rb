module Api
  module V1
    class SessionsController < ApplicationController
      allow_unauthenticated_access only: :create
      rate_limit to: 10, within: 3.minutes, only: :create,
                 with: -> { render json: { error: "Demasiadas tentativas. Tenta mais tarde." }, status: :too_many_requests }

      def create
        user = User.authenticate_by(email: params[:email].to_s.strip.downcase, password: params[:password].to_s)

        if user
          session = start_session_for(user)
          render json: { token: session.token, user: user }, status: :created
        else
          render json: { error: "Email ou palavra-passe inválidos" }, status: :unauthorized
        end
      end

      def destroy
        current_session.destroy
        head :no_content
      end
    end
  end
end
