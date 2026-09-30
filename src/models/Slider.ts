import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

/** Hero slides of the home page */
export class Slider extends Model<InferAttributes<Slider>, InferCreationAttributes<Slider>> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare subtitle: CreationOptional<string | null>;
    declare image: CreationOptional<string | null>;
    declare link: CreationOptional<string | null>;
    declare target_page: CreationOptional<string>;
    declare button_text: CreationOptional<string | null>;
    declare is_active: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    static initialize(sequelize: Sequelize): void {
        Slider.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                title: { type: DataTypes.STRING(500), allowNull: false },
                subtitle: { type: DataTypes.STRING(1000), allowNull: true },
                image: { type: DataTypes.STRING(300), allowNull: true },
                link: { type: DataTypes.STRING(500), allowNull: true },
                target_page: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '_blank' },
                button_text: { type: DataTypes.STRING(200), allowNull: true },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'heros',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
