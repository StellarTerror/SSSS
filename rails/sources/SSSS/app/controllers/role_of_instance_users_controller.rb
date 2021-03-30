class RoleOfInstanceUsersController < ApplicationController
  def valid_checker(email, password)
    user = User.find_by(email: email)
		if user.nil?
			return false
		end
    return user[:password] == password
  end

  def index_by_instance_user
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group cant accessed'} and return
      end
      
      instance_user = InstanceUser.find_by(random_token: params[:token], group_id: group[:id])
      if instance_user.nil?
        render json: { status: 'Failed', message: 'this instance user cant accessed'} and return
      end

      roles_of_users = RoleOfInstanceUser.where(instance_user_id: instance_user)

      post_data = Array.new
      roles_of_users.each { |roles_of_user|
        role = Role.find_by(id: roles_of_user[:role_id])
        if role.present?
          post_data.push({name: role[:name], id: role[:id]})
        end
      }
      render json: { status: 'Success', roles: post_data } and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def add
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group cant accessed'} and return
      end
      
      instance_user = InstanceUser.find_by(random_token: params[:token], group_id: group[:id])
      if instance_user.nil?
        render json: { status: 'Failed', message: 'this instance user cant accessed'} and return
      end

      role = Role.find_by(id: params[:role_id], group_id: params[:group_id])
      if role.nil?
        render json: { status: 'Failed', message: 'this role is invalid'} and return
      end
      if RoleOfInstanceUser.find_by(role_id: role[:id], instance_user_id: instance_user[:id]).nil?
      
        RoleOfInstanceUser.create(role_id: role[:id], instance_user_id: instance_user[:id]).save
        render json: { status: 'Success', message: 'added role' } and return
      else
        render json: { status: 'Failed', message: 'already assigned'} and return
      end
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def erase
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(owner_user_id: user[:id], id: params[:group_id])
      if group.nil?
        render json: { status: 'Failed', message: 'this group cant accessed'} and return
      end
      
      instance_user = InstanceUser.find_by(random_token: params[:token], group_id: group[:id])
      if instance_user.nil?
        render json: { status: 'Failed', message: 'this instance user cant accessed'} and return
      end

      role = Role.find_by(id: params[:role_id], group_id: params[:group_id])
      if role.nil?
        render json: { status: 'Failed', message: 'this role is invalid'} and return
      end

      role_of_user = RoleOfInstanceUser.find_by(role_id: role[:id], instance_user_id: instance_user[:id])
      if role_of_user.nil?
        render json: { status: 'Failed', message: 'this role is not assigned'} and return
      end

      role_of_user.destroy
      render json: { status: 'Success', message: 'unpatch role' } and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end
end
