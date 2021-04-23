class EmployeesRequiredOfRolesController < ApplicationController
  def valid_checker(email, password)
    user = User.find_by(email: email)
		if user.nil?
			return false
		end
    return user[:password] == password
  end

  def index
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])

      group = Group.find_by(id: params[:group_id], owner_user_id: user[:id])
      roles = Role.where(group_id: params[:group_id])

      if group.nil?
        render json: { status: 'Failed', message: 'cant accese'} and return
      end

      post_data = Array.new
      date_list = Array.new

      roles.each do |role|

        requireds = EmployeesRequired.where(group_id: group[:id],role_id: role[:id])

        requireds = requireds.sort { |a, b| a[:start_datetime] <=> b[:start_datetime] } 
      
        current_num = -1
        current_start_datetime = nil
        date_list = Array.new

        requireds.each do |required|
          date_list.push(required[:start_datetime].to_date) if date_list.last != required[:start_datetime].to_date

          if current_num == -1
            current_num = required[:required_num]
            current_start_datetime = required[:start_datetime]

            if (required[:start_datetime].hour == 23 && required[:start_datetime].min == 30)
              post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: (required[:start_datetime] + 1800).to_s, num: current_num, role_name: role[:name], role_id: role[:id]})
              current_num = -1
              current_start_datetime = nil
            end
          else
            if current_num != required[:required_num]
              post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: required[:start_datetime].to_s, num: current_num,  role_name: role[:name], role_id: role[:id]})
              current_start_datetime = required[:start_datetime]
              current_num = required[:required_num]
            end

            if (required[:start_datetime].hour == 23 && required[:start_datetime].min == 30)
              post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: (required[:start_datetime] + 1800).to_s, num: current_num, role_name: role[:name], role_id: role[:id]})
              current_num = -1
              current_start_datetime = nil
            end
          end
        end
      end

      date_list = date_list.map { |date| {date: date.to_s} } 
      render json: { status: 'Success', requireds: post_data, dates: date_list } and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def update_num
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      role = Role.find_by(id: params[:role_id], group_id: params[:group_id])

      group = Group.find_by(id: params[:group_id], owner_user_id: user[:id])
      if group.nil?
        render json: { status: 'Failed', message: 'cant accese'} and return
      end
      if role.nil?
        render json: { status: 'Failed', message: 'cant accese'} and return
      end

      if params[:requireds].blank?
        render json: { status: 'Failed', message: 'requireds is blank'} and return
      end

      params[:requireds].each do |required|
        idx_datetime = DateTime.parse(required[:start_datetime])

        end_datetime = DateTime.parse(required[:end_datetime])
        while idx_datetime < end_datetime
          record = EmployeesRequired.find_by(group_id: group[:id], role_id: role[:id], start_datetime: idx_datetime, role_id: role[:id])
          if record.present? && required[:num].to_s =~ /^\d+$/
            record.update!(required_num: required[:num].to_i )
            record.save
          end
          idx_datetime += Rational(30, 24 * 60)
        end
      end
      render json: { status: 'Success', message: 'added Request'} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end
end
