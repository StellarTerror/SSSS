class FixedShiftsController < ApplicationController
  def valid_checker(email, password)
    user = User.find_by(email: email)
		if user.nil?
			return false
		end
    return user[:password] == password
  end

  def update
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      if params[:shifts].blank?
        render json: { status: 'Failed', message: 'shifts is blank'} and return
      end

      instance_user = InstanceUser.find_by(random_token: params[:random_token], group_id: group[:id])
      if instance_user.nil?
        render json: { status: 'Failed', message: 'this token is invalid'} and return
      end


      params[:shifts].each do |request|
        idx_datetime = DateTime.parse(request[:start_datetime])

        end_datetime = DateTime.parse(request[:end_datetime])
        while idx_datetime < end_datetime 
          record = FixedShift.find_by(instance_user_id: instance_user[:id], start_datetime: idx_datetime)
          if record.present?
            role = Role.find_by(id: request[:status], group_id: params[:group_id])
            if role.nil? && request[:status].to_i != -1
              idx_datetime += Rational(30, 24 * 60)
              next
            end 

            record.update!(shift_status: request[:status])
            
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

  def index
    instance_user = InstanceUser.find_by(random_token: params[:random_token])
    if instance_user.nil?
      render json: { status: 'Failed', message: 'this token is invalid'} and return
    end

    post_data = Array.new

    requests = FixedShift.where(instance_user_id: instance_user[:id])

    requests = requests.sort { |a, b| a[:start_datetime] <=> b[:start_datetime] } 
    
    current_status = nil
    current_start_datetime = nil
    date_list = Array.new

    requests.each do |request|
      date_list.push(request[:start_datetime].to_date) if date_list.last != request[:start_datetime].to_date

      if current_status.nil?
        current_status = request[:shift_status]
        current_start_datetime = request[:start_datetime]
      else
        if current_status != request[:shift_status]
          if current_status == -1
            post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: request[:start_datetime].to_s, status: current_status, role_name: nil})
          else
            role = Role.find_by(id: current_status)
            post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: request[:start_datetime].to_s, status: current_status, role_name: role[:name]})
          end
          current_start_datetime = request[:start_datetime]
          current_status = request[:shift_status]
        end

        if (request[:start_datetime].hour == 23 && request[:start_datetime].min == 30)
          if current_status == -1 
            post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: (request[:start_datetime] + 1800).to_s, status: current_status, role_name: nil})
          else
            role = Role.find_by(id: current_status)
            post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: (request[:start_datetime] + 1800).to_s, status: current_status, role_name: role[:name]})
          end
          current_status = nil
          current_start_datetime = nil
        end
      end
    end
    
    date_list = date_list.map { |date| {date: date.to_s} } 

    render json: { status: 'Success', shifts: post_data, dates: date_list, user_name:instance_user[:name] } and return
  end

  def call_amplify
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      is_used = UsedAmplify.find_by(group_id: group[:id])
      if is_used[:is_used] == 1
        render json: { status: 'Failed', message: 'shift is already fixed'} and return
      end

      random_str = rand(1000000000000000000000000000000000000000000000000).to_s

      instance_users = InstanceUser.where(group_id: group[:id])
      roles = Role.where(group_id: group[:id])
      requireds = EmployeesRequired.where(group_id: group[:id], role_id: roles.first[:id]) 
      requests = ShiftRequest.where(group_id: group[:id]) 

      if instance_users.size <= 0
        render json: { status: 'Failed', message: 'instance user is blank'} and return
      end

      ## ここから入力ファイル生成

      system("touch /SSSS/communication/#{random_str}_input.txt")
    
      File.open("/SSSS/communication/#{random_str}_input.txt", "w") do |text|
        text.puts("#{requireds.size} #{instance_users.size} #{roles.size}")
        instance_users.each do |instance_user|
          roles.each do |role|
            if RoleOfInstanceUser.find_by(instance_user_id: instance_user[:id], role_id: role[:id]).nil?
              text.print("0 ")
            else
              text.print("1 ")
            end
          end
          text.puts("")
        end
         
        roles.each do |role|
          requireds = EmployeesRequired.where(group_id: group[:id], role_id: role[:id]).sort { |a, b| a[:start_datetime] <=> b[:start_datetime] }

          requireds.each do |required|
            text.print("#{required[:required_num]} ")
          end

          text.puts("")
        end

        instance_users.each do |instance_user|
          requests = ShiftRequest.where(group_id: group[:id], instance_user_id: instance_user[:id]).sort { |a, b| a[:start_datetime] <=> b[:start_datetime] }

          requests.each do |request|
            text.print("#{request[:shift_status]} ")
          end

          text.puts("")
        end
      end

      ## amplify 呼ぶ

      result = true
      command = Thread.new do
        result = system("python /SSSS/python/SSSS.py < /SSSS/communication/#{random_str}_input.txt > /SSSS/communication/#{random_str}_output.txt")
      end
      command.join

      if result == false
        render json: { status: 'Failed', message: 'solver error'} and return
      end

      File.open("/SSSS/communication/#{random_str}_output.txt", mode = "rt") do |f|

        f.each_line.with_index(0) do |line, idx|
          instance_user = instance_users[idx]

          shifts = FixedShift.where(group_id: group[:id], instance_user_id: instance_user[:id]).sort { |a, b| a[:start_datetime] <=> b[:start_datetime] }

          line.split.each.with_index(0) do |status, idx|
            status = status.to_i
            if status == -1
              shifts[idx].update!(shift_status: -1)
              shifts[idx].save
            else
              shifts[idx].update!(shift_status: roles[status - 1][:id])
              shifts[idx].save
            end
          end
        end
      end

      is_used[:is_used] = 1
      is_used.save

      render json: { status: 'Success', message: 'called amplify'} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def invalid_dates
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      requireds = EmployeesRequired.where(group_id: group[:id]).sort { |a, b| a[:start_datetime] <=> b[:start_datetime] } 
      roles = Role.where(group_id: group[:id])

      post_data = Array.new

      current_start_datetime = nil

      date_hash = Hash.new

      requireds.each do |required|
        fixed_shifts = FixedShift.where(group_id: group[:id], shift_status: required[:role_id], start_datetime: required[:start_datetime])
        date_hash[required[:start_datetime]] = 0 if !date_hash.has_key?(required[:start_datetime])

        if fixed_shifts.size < required[:required_num]
          date_hash[required[:start_datetime]] = 1
        end
      end

      post_data = Array.new
      current_status = nil
      current_start_datetime = nil

      date_hash.each do |key, value|
  
        if current_status == nil
          current_status = value
          current_start_datetime = key
        else
          if current_status != value || current_start_datetime.to_date != key.to_date
            post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: key.to_s, status: current_status})
            current_start_datetime = key
            current_status = value
          end
        end
      end
      post_data.push({start_datetime: current_start_datetime.to_s, end_datetime: (date_hash.to_a.last[0] + 1800).to_s, status: current_status}) if !post_data.blank?

      render json: { status: 'Success', dates: post_data} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end
end
