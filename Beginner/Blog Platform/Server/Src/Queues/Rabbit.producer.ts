import amqp from "amqplib";
import { RABBITMQ_URL } from "../Config/Env.js";

const channel = amqp.connect("");
channel.then(async (connection) => {
  const rabbitChannel: amqp.Channel = await connection.createChannel();

  rabbitChannel.assertExchange("broadcast", "fanout");

  rabbitChannel.publish("Broadcast", "", Buffer.from([]));
});

export class RabbitMq {
  channel: amqp.ChannelModel | null = null;

  constructor() {}

  async createConnection(): Promise<void> {
    if (this.channel) this.channel = await amqp.connect(RABBITMQ_URL!);
  }

  async createChannel() {}
}
