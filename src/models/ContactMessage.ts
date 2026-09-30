import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

export class ContactMessage extends Model<InferAttributes<ContactMessage>, InferCreationAttributes<ContactMessage>> {
    declare id: CreationOptional<number>;
    declare first_name: string;
    declare last_name: string;
    declare phone: string;
    declare email: string;
    declare city: string;
    declare client_message: string;
    declare date: CreationOptional<Date | null>;

    static initialize(sequelize: Sequelize): void {
        ContactMessage.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                first_name: { type: DataTypes.STRING(200), allowNull: false },
                last_name: { type: DataTypes.STRING(200), allowNull: false },
                phone: { type: DataTypes.STRING(200), allowNull: false },
                email: { type: DataTypes.STRING(200), allowNull: false },
                city: { type: DataTypes.STRING(500), allowNull: false },
                client_message: { type: DataTypes.STRING(1000), allowNull: false },
                date: { type: DataTypes.DATE, allowNull: true },
            },
            {
                sequelize,
                tableName: 'contact_messages',
                timestamps: false,
            },
        );
    }
}
