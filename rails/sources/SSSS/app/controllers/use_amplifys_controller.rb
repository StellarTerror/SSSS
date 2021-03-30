class UseAmplifysController < ApplicationController
  def valid_checker(email, password)
    user = User.find_by(email: email)
		if user.nil?
			return false
		end
    return user[:password] == password
  end

  def is_used_by_owner
    if valid_checker(params[:email], params[:password])
      user = User.find_by(email: params[:email])
      group = Group.find_by(id: params[:group_id], owner_user_id: user[:id])
      if group.nil?
        render json: { status: 'Failed', message: 'cant accese'} and return
      end

      is_used = UsedAmplify.find_by(group_id: group[:id])

      render json: { status: 'Success', is_used: is_used[:is_used]} and return
    else
      render json: { status: 'Failed', message: 'invalid user. please log-in'} and return
    end
  end

  def is_used_by_member
    instance_user = InstanceUser.find_by(random_token: params[:random_token])
    if instance_user.nil?
      render json: { status: 'Failed', message: 'this token is invalid'} and return
    end

    is_used = UsedAmplify.find_by(group_id: instance_user[:group_id])

    render json: { status: 'Success', is_used: is_used[:is_used]} and return
  end
end
