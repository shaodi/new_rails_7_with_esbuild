# frozen_string_literal: true

class Twitter < ApplicationRecord
  validates :title, presence: true, length: { maximum: 100 }
  validates :content, presence: true, length: { maximum: 400 }
end
