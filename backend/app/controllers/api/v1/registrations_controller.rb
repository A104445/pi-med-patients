module Api
  module V1
    class RegistrationsController < ApplicationController
      allow_unauthenticated_access

      def create
        user = User.new(user_params)

        if user.save
          session = start_session_for(user)
          render json: { token: session.token, user: user }, status: :created
        else
          render json: { errors: user.errors.to_hash(true) }, status: :unprocessable_content
        end
      end

      private

      def user_params
        params.expect(user: %i[name email password])
      end
    end
  end
end
