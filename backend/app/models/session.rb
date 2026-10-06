# Sessão de autenticação de um dispositivo. O token em claro só é devolvido
# ao cliente no momento da criação; na base de dados guardamos apenas o digest.
class Session < ApplicationRecord
  belongs_to :user

  attr_reader :token

  before_validation :generate_token, on: :create

  def self.digest(token)
    OpenSSL::Digest::SHA256.hexdigest(token)
  end

  def self.find_by_token(token)
    return if token.blank?

    find_by(token_digest: digest(token))
  end

  def touch_last_used!
    update_column(:last_used_at, Time.current) if last_used_at.nil? || last_used_at < 5.minutes.ago
  end

  private

  def generate_token
    @token = SecureRandom.base58(32)
    self.token_digest = self.class.digest(@token)
  end
end
