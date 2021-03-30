class ShiftRequestsController < ApplicationController
  def index
    instance_user = InstanceUser.find_by(random_token: params[:random_token])
    if instance_user.nil?
      render json: { status: 'Failed', message: 'this token is invalid'} and return
    end

    post_data = Array.new
    date_list = Array.new

    requests = ShiftRequest.where(instance_user_id: instance_user[:id])

    requests = requests.sort { |a, b| a[:start_datetime] <=> b[:start_datetime] } 
    
    current_status = nil
    current_start_datetime = nil
    requests.each do |request|
      date_list.push(request[:start_datetime].to_date) if date_list.last != request[:start_datetime].to_date

      if current_status == nil
        current_status = request[:shift_status]
        current_start_datetime = request[:start_datetime]
      else
        if current_status != request[:shift_status]
          post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: request[:start_datetime].to_s, status: current_status})
          current_start_datetime = request[:start_datetime]
          current_status = request[:shift_status]
        end

        if (request[:start_datetime].hour == 23 && request[:start_datetime].min == 30)
          post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: (request[:start_datetime] + 1800).to_s, status: current_status})
          current_status = nil
          current_start_datetime = nil
        end
      end
    end
    
    date_list = date_list.map { |date| {date: date.to_s} } 

    render json: { status: 'Success', requests: post_data, dates: date_list, user_name: instance_user[:name]} and return
  end

  def update
    instance_user = InstanceUser.find_by(random_token: params[:random_token])
    if instance_user.nil?
      render json: { status: 'Failed', message: 'this token is invalid'} and return
    end

    if params[:requests].blank?
      render json: { status: 'Failed', message: 'requireds is blank'} and return
    end

    params[:requests].each do |request|
      idx_datetime = DateTime.parse(request[:start_datetime])

      end_datetime = DateTime.parse(request[:end_datetime])
      while idx_datetime < end_datetime
        record = ShiftRequest.find_by(instance_user_id: instance_user[:id], start_datetime: idx_datetime)
        if record.present?
          record.update!(shift_status: request[:status])
          record.save
        end
        idx_datetime += Rational(30, 24 * 60)
      end
    end
    render json: { status: 'Success', message: 'added Request'} and return
  end
end
