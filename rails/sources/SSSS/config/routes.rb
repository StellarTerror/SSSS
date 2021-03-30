Rails.application.routes.draw do
  post '/user/log_in',  to: 'users#log_in'
  post '/user/sign_up', to: 'users#sign_up'
  post '/user/change_name', to: 'users#change_name'
  post '/user/change_email', to: 'users#change_email'
  post '/user/change_password', to: 'users#change_password'

  post '/group/index', to: 'groups#index'
  post '/group/add', to: 'groups#add_group'
  post '/group/erase', to: 'groups#erase_group'
  post '/group/get_name', to: 'groups#get_name'

  post '/instance_user/add', to: 'instance_users#add_user'
  post '/instance_user/erase', to: 'instance_users#erase_user'
  post '/instance_user/edit_name', to: 'instance_users#edit_name'
  post '/instance_user/index', to: 'instance_users#index'

  post '/employees_required/index', to: 'employees_required_of_roles#index'
  post '/employees_required/update', to: 'employees_required_of_roles#update_num'

  post '/role/index', to: 'roles#index'
  post '/role/add', to: 'roles#add'
  post '/role/erase', to: 'roles#erase'
  post '/role/edit', to: 'roles#edit_name'

  post '/role_assign/index_by_user', to: 'role_of_instance_users#index_by_instance_user'
  post '/role_assign/assign', to: 'role_of_instance_users#add'
  post '/role_assign/unassign', to: 'role_of_instance_users#erase'

  post '/shift_request/index', to: 'shift_requests#index'
  post '/shift_request/update', to: 'shift_requests#update'

  post '/fixed_shift/index', to: 'fixed_shifts#index'
  post '/fixed_shift/update', to: 'fixed_shifts#update'
  post '/fixed_shift/fix_shift', to: 'fixed_shifts#call_amplify'
  post '/fixed_shift/invalid', to: 'fixed_shifts#invalid_dates'

  post '/is_fixed/by_owner', to: 'use_amplifys#is_used_by_owner'
  post '/is_fixed/by_member', to: 'use_amplifys#is_used_by_member'
end
