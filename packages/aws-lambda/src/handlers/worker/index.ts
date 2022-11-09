
import { IApp } from '../../app'
import { Next } from '../../compose'
import { ViewableError } from '../../errors/viewable'

export const worker = () => {
	return async (app:IApp, next:Next) => {

		const input = app.input;

		// ----------------------------------------------------
		// Single work processed

		if(!(typeof input === 'object' && input !== null)) {
			app.records = [{ payload: input }];
			return next();
		}

		if(Array.isArray(input)) {
			app.records = input.map(payload => { payload });
			return next();
		}

		const records = input.Records;

		if(!Array.isArray(records)) {
			app.records = [{ payload: input }];
			return next();
		}

		// ----------------------------------------------------
		// Batch of work processed

		app.records = records.map(parseRecord);

		try {
			await next()
		} catch(error) {
			if(error instanceof ViewableError && app.has('log')) {
				await app.log(error)
			}

			throw error;
		}
	}
}

const parseRecord = (record) => {
	if(record.Sns) return parseSnsRecord(record); // SNS
	if(record.body) return parseSqsRecord(record); // SQS

	throw new Error(`Unrecognized record source: ${JSON.stringify(record)}`);
}

interface Record {
	id:	string;
	payload: any;
	date: Date;
	attributes: object;
	raw: object;
}

interface SnsRecord extends Record {
	topicArn: string;
}

interface SqsMessageAttribute {
	dataType: string;
	stringValue: string;
}

const parseSqsRecord = (record): Record => {
	const attributes = {};
	Object.entries(record.messageAttributes as SqsMessageAttribute[]).forEach(([key, attribute]) => {
		if(attribute.dataType === 'String') {
			attributes[key] = attribute.stringValue;
		}
	});

	return {
		id: 		record.messageId,
		payload: 	JSON.parse(record.body),
		date:		new Date(Number(record.attributes.SentTimestamp)),
		raw:		record,
		attributes,
	}
}

interface SnsMessageAttribute {
	Value: string;
}

const parseSnsRecord = (record): SnsRecord => {
	const attributes = {};
	Object.entries(record.Sns.MessageAttributes as SnsMessageAttribute[]).forEach(([key, attribute]) => {
		attributes[key] = attribute.Value;
	});

	return {
		id:			record.Sns.MessageId,
		payload:	JSON.parse(record.Sns.Message),
		date:		new Date(Number(record.Sns.Timestamp)),
		topicArn:	record.Sns.TopicArn,
		raw:		record,
		attributes,
	}
}
