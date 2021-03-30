class CreateInstanceUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :instance_users do |t|
      t.string :name
      t.integer :group_id
      t.string :random_token

      t.timestamps
    end
  end
end
