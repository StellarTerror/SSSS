class InstanceUsersController < ApplicationController
  def valid_checker(email, password)
    user = User.find_by(email: email)
		if user.nil?
			return false
		end
    return user[:password] == password
  end

	def add_user
		if valid_checker(params[:email], params[:password])
			user = User.find_by(email: params[:email])
			group = Group.find_by(id: params[:group_id])

			if group.nil?
				render json: { status: 'Failed', message: 'group is not found'} and return
			end

      instance_users = InstanceUser.where(group_id: group[:id])

      if instance_users.size >= 30
        render json: { status: 'Failed', message: 'instance user is too many'} and return
      end

			if group[:owner_user_id] == user[:id]
				if params[:name].blank?
					render json: { status: 'Failed', message: 'screen name is blank'} and return
				end
				instance_user = InstanceUser.create!(random_token: rand(1000000000000000000000000000000000000000000000000).to_s, group_id: group[:id], name: params[:name])
				role = Role.find_by(group_id: group[:id])
				role_of = RoleOfInstanceUser.create!(instance_user_id: instance_user[:id], role_id: role[:id])

        requireds = EmployeesRequired.where(group_id: group[:id], role_id: role[:id])
        requireds.each do |required|
          ShiftRequest.create(start_datetime: required[:start_datetime], instance_user_id: instance_user[:id], group_id: group[:id], shift_status: 0).save
		      FixedShift.create(start_datetime: required[:start_datetime], instance_user_id: instance_user[:id], group_id: group[:id], shift_status: -1).save
          end
        
		  role_of.save
		  instance_user.save
				render json: { status: 'Success', message: 'user added', random_token: instance_user[:random_token]} and return
			else
				render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
			end
		else
			render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
		end
	end

	def erase_user
		if valid_checker(params[:email], params[:password])
			user = User.find_by(email: params[:email])
			group = Group.find_by(id: params[:group_id])
			if group.nil?
				render json: { status: 'Failed', message: 'group is not found'} and return
			end
			instance_user = InstanceUser.find_by(random_token: params[:random_token])
			if group[:owner_user_id] == user[:id] && group[:id] == instance_user[:group_id]
				instance_user.destroy!

				ShiftRequest.where(instance_user_id: instance_user[:id]).each { |request| request.destroy }
				FixedShift.where(instance_user_id: instance_user[:id]).each { |request| request.destroy }

				render json: { status: 'Success', message: 'user deleted'} and return
			else
				render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
			end
		else
			render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
		end
	end

	def edit_name
		if valid_checker(params[:email], params[:password])
			user = User.find_by(email: params[:email])
			group = Group.find_by(id: params[:group_id])
			if group.nil?
				render json: { status: 'Failed', message: 'group is not found'} and return
			end
			instance_user = InstanceUser.find_by(random_token: params[:random_token])
			if group[:owner_user_id] == user[:id] && group[:id] == instance_user[:group_id]
				if params[:name].blank?
					render json: { status: 'Failed', message: 'screen name is blank'} and return
				end
				instance_user.update!(name: params[:name])
				instance_user.save
				render json: { status: 'Success', message: 'user edited'} and return
			else
				render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
			end
		else
			render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
		end
	end

	def index
		if valid_checker(params[:email], params[:password])
			user = User.find_by(email: params[:email])
			group = Group.find_by(id: params[:group_id])

			if group.nil?
				render json: { status: 'Failed', message: 'group is not found'} and return
			end

			if group[:owner_user_id] == user[:id]

				instance_users = InstanceUser.where(group_id: group[:id])

				instance_users = instance_users.map { |instance_user| {name: instance_user[:name], random_token: instance_user[:random_token]} }
				render json: { status: 'Success', instance_users: instance_users} and return
			else
				render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
			end
		else
			render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
		end
	end
end
