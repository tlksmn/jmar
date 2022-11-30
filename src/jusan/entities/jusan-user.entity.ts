import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  primaryCookie: string;

  @Column({ type: 'varchar', nullable: true })
  secondaryCookie: string;
}
