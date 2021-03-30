class RolesController < ApplicationController
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

      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      roles = Role.where(group_id: group[:id])

      roles = roles.map { |role| {id: role[:id], name: role[:name] } }

      render json: { status: 'Success', roles: roles} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def add
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])

      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      if params[:name].blank?
        render json: { status: 'Failed', message: 'role name is blank'} and return
      end
      roles = Role.where(group_id: params[:group_id])
      if roles.size >= 4
        render json: { status: 'Failed', message: 'roles is too many'} and return
      end
      current_roles = Role.find_by(group_id: params[:group_id])

      role = Role.create(name: params[:name], group_id: group[:id])
      role.save

      requireds = EmployeesRequired.where(role_id: current_roles[:id])
      requireds.each do |required|
        EmployeesRequired.create(group_id: required[:group_id], start_datetime: required[:start_datetime], role_id: role[:id], required_num: 0).save
      end

      render json: { status: 'Success', message: 'added', id: role[:id]} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def erase
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])

      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      role = Role.find_by(id: params[:role_id])
      if role.nil?
        render json: { status: 'Failed', message: 'invalid role id'} and return
      end

      role_front = Role.find_by(group_id: params[:group_id])
      if role_front == role
        render json: { status: 'Failed', message: 'this role cant be delete'} and return
      end

      requireds = EmployeesRequired.where(role_id: role[:id])
      requireds.each do |required|
        required.destroy
      end

      role.destroy

      render json: { status: 'Success', message: 'added'} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def edit_name
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])

      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group can not accecesd'} and return
      end

      if params[:name].blank?
        render json: { status: 'Failed', message: 'role name is blank'} and return
      end

      role = Role.find_by(id: params[:role_id])
      if role.nil?
        render json: { status: 'Failed', message: 'invalid role id'} and return
      end

      role.update!(name: params[:name])
      role.save

      render json: { status: 'Success', message: 'edit_name', id: role[:id]} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end
end
