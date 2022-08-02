# frozen_string_literal: true

json.extract! twitter, :id, :title, :content, :created_at, :updated_at
json.url twitter_url(twitter, format: :json)
