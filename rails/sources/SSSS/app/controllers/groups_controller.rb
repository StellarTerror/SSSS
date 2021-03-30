class GroupsController < ApplicationController
  def valid_checker(email, password)
    user = User.find_by(email: email)
		if user.nil?
			return false
		end
    return user[:password] == password
  end

  def index
    if valid_checker(params[:email], params[:password])
      user_id = User.find_by(email: params[:email]).id
      groups = Group.where(owner_user_id: user_id)

      groups = groups.map { |group| {id: group[:id], name: group[:name]} }

      render json: { status: 'Success', groups: groups} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def add_group
    if valid_checker(params[:email], params[:password])
      user_id = User.find_by(email: params[:email]).id
      if params[:name].blank?
        render json: { status: 'Failed', message: 'group name is blank'} and return
      end

      group = Group.create!(owner_user_id: user_id, name: params[:name])
      role = Role.create!(group_id: group[:id], name: 'default')
      used_amplify = UsedAmplify.create(group_id: group[:id], is_used: 0)
      group.save
      role.save
      used_amplify.save

      if params[:use_dates].blank?
        render json: { status: 'Failed', message: 'use date is invalid'} and return
      end

      if params[:use_dates].size > 7
        render json: { status: 'Failed', message: 'use date is many'} and return
      end

      params[:use_dates].each do |date|
        Range.new(0, 23).each do |hour|
          datetime = date[:date] + " #{hour}:00:00"
          EmployeesRequired.create!(group_id: group[:id], role_id: role[:id], start_datetime: DateTime.parse(datetime), required_num: 0).save
          datetime = date[:date] + " #{hour}:30:00"
          EmployeesRequired.create!(group_id: group[:id], role_id: role[:id], start_datetime: DateTime.parse(datetime), required_num: 0).save
        end
      end

      
      render json: { status: 'Success', message: 'group added', group_id: group[:id]} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def erase_group
    if valid_checker(params[:email], params[:password])
      user_id = User.find_by(email: params[:email]).id

      group = Group.find_by(id: params[:group_id], owner_user_id: user_id)
      if group.nil?
        render json: { status: 'Failed', message: 'cant accese'} and return
      end

      used_amplify = UsedAmplify.find_by(group_id: group[:id])

      instance_users = InstanceUser.where(group_id: group[:id])
      instance_users.each do |instance_user|
        role_ofs = RoleOfInstanceUser.where(instance_user_id: instance_user[:id])
        role_ofs.each { |role_of| role_of.destroy }
        instance_user.destroy
      end

      shift_requests = ShiftRequest.where(group_id: group[:id])
      shift_requests.each do |shift_request|
        shift_request.destroy
      end

      roles = Role.where(group_id: group[:id])
      roles.each do |role|
        role.destroy
      end

      requireds = EmployeesRequired.where(group_id: group[:id])
      requireds.each do |required|
        required.destroy
      end

      shift_request = FixedShift.where(group_id: group[:id])
      shift_requests.each do |request|
        request.destroy
      end

      used_amplify.destroy!
      group.destroy!
      render json: { status: 'Success', message: 'group deleted'} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def get_name
    if valid_checker(params[:email], params[:password])
      user_id = User.find_by(email: params[:email]).id
      group = Group.find_by(owner_user_id: user_id, id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'invalid group id'} and return
      end

      render json: { status: 'Success', name: group[:name]} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end
end
