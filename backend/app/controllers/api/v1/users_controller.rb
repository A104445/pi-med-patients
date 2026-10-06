module Api
  module V1
    class UsersController < ApplicationController
      def me
        render json: { user: current_user }
      end
    end
  end
end
