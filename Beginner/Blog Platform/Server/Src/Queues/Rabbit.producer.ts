import amqp from "amqplib";
import { RABBITMQ_URL } from "../Config/Env.js";

type Work = {
  type: "Cache";
  message: any;
};

export class RabbitMq {
  connection: amqp.ChannelModel | null = null;
  rabbitChannel: amqp.Channel | null = null;
  rabbitExchange: amqp.Replies.AssertExchange | null = null;
  exchangeName: string;

  constructor(exchangeName: string) {
    this.exchangeName = exchangeName;
  }

  async createConnection(exchangeName: string): Promise<void> {
    this.exchangeName = exchangeName;
    if (!this.connection) this.connection = await amqp.connect(RABBITMQ_URL!);

    this.rabbitChannel = await this.connection.createChannel();
    this.rabbitExchange = await this.rabbitChannel.assertExchange(
      this.exchangeName,
      "fanout",
      {
        durable: true,
      },
    );
  }

  async publishMessage(message: any) {
    if (!this.connection) await this.createConnection(this.exchangeName);

    this.rabbitChannel!.publish(this.exchangeName, "", Buffer.from(message));
  }

  async consumeMessage() {
    if (!this.connection) {
      await this.createConnection(this.exchangeName);
      return;
    }

    this.rabbitChannel!.consume(
      this.exchangeName,
      (message: amqp.ConsumeMessage | null) => {
        if (message) console.log(message.content.toString());
      },
    );
  }
}
