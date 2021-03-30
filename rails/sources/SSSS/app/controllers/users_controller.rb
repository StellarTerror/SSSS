class UsersController < ApplicationController
  def log_in
    user = User.find_by(email: params[:email])
    if user.nil?
      render json: { status: 'Failed', message: 'このemail アドレスは登録されていません'} and return
    end
    if user[:password] == params[:password]
      render json: { status: 'Success', message: 'ログインしました', name: user[:name]} and return
    else
      render json: { status: 'Failed', message: 'パスワードが間違っています'} and return
    end
  end

  def sign_up
    if params[:email].blank?
      render json: { status: 'Failed', message: 'このメールアドレスは空です'} and return
    end
    user = User.find_by(email: params[:email])

    if !user.nil?
      render json: { status: 'Failed', message: '既に使われているメールアドレスです'} and return
    end
    if params[:name].blank?
      render json: { status: 'Failed', message: 'このユーザネームは空です'} and return
    end
    if params[:password].blank?
      render json: { status: 'Failed', message: 'このパスワードが空です'} and return
    end
    user = User.create(name: params[:name], email: params[:email], password: params[:password])
    user.save
    render json: { status: 'Success'} and return
  end

  def change_name
    if params[:email].blank?
      render json: { status: 'Failed', message: 'this mail adress is empty'} and return
    end
    user = User.find_by(email: params[:email])
    if params[:name].blank?
      render json: { status: 'Failed', message: 'user name is blank'} and return
    end
    if params[:password].blank?
      render json: { status: 'Failed', message: 'password is blank'} and return
    end
    if !user.blank?
      render json: { status: 'Failed', message: 'this mail adress is already used'} and return
    end
    if user[:password] == params[:password]
      user.update!(name: params[:name])
      user.save
      render json: { status: 'Success', message: 'changed username'} and return
    else
      render json: { status: 'Failed', message: 'wrong password'} and return
    end
  end

  def change_email
    if params[:current_email].blank?
      render json: { status: 'Failed', message: 'current mail adress is empty'} and return
    end
    user = User.find_by(email: params[:current_email])
    if params[:new_email].blank?
      render json: { status: 'Failed', message: 'new email is blank'} and return
    end
    if params[:password].blank?
      render json: { status: 'Failed', message: 'password is blank'} and return
    end
    if !user.blank?
      render json: { status: 'Failed', message: 'this mail adress is already used'} and return
    end
    if user[:password] == params[:password]
      user.update!(email: params[:new_email])
      user.save
      render json: { status: 'Success', message: 'changed email'} and return
    else
      render json: { status: 'Failed', message: 'wrong password'} and return
    end
  end

  def change_password
    if params[:email].blank?
      render json: { status: 'Failed', message: 'this mail adress is empty'} and return
    end
    user = User.find_by(email: params[:email])
    if params[:current_password].blank?
      render json: { status: 'Failed', message: 'current password is blank'} and return
    end
    if !user.blank?
      render json: { status: 'Failed', message: 'this mail adress is not registed'} and return
    end
    if params[:new_password].blank?
      render json: { status: 'Failed', message: 'new password is blank'} and return
    end
    if user[:password] == params[:current_password]
      user.update!(password: params[:new_password])
      user.save
      render json: { status: 'Success', message: 'changed password'} and return
    else
      render json: { status: 'Failed', message: 'wrong password'} and return
    end
  end
end
