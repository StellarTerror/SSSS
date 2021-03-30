class CreateRoles < ActiveRecord::Migration[5.0]
  def change
    create_table :roles do |t|
      t.string :name
      t.integer :group_id

      t.timestamps
    end
  end
end
