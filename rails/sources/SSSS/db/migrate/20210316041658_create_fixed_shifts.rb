class CreateFixedShifts < ActiveRecord::Migration[5.0]
  def change
    create_table :fixed_shifts do |t|
      t.integer :group_id
      t.integer :role_id
      t.datetime :start_datetime
      t.integer :instance_user_id

      t.timestamps
    end
  end
end
