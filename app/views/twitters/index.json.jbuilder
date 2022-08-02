# frozen_string_literal: true

json.array! @twitters, partial: 'twitters/twitter', as: :twitter
