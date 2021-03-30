class CreateRoleOfInstanceUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :role_of_instance_users do |t|
      t.integer :instance_user_id
      t.integer :role_id

      t.timestamps
    end
  end
end
