import { Client, Pool } from 'pg';

// #TODO: Implement JOIN

export default class PgCrud {
  static __pool__ = null;

  constructor(settings) {
    if (typeof settings !== 'object') {
      throw new Error('Missing config');
    }
    if (typeof settings.connectionString !== 'string') {
      throw new Error('Missing Database URL');
    }

    this.connectionString = settings.connectionString;
    this.domain = settings.domain;
    this.primaryKey = settings.primaryKey || 'id';
    this.relations = Array.isArray(settings.relations)
      ? settings.relations
      : typeof settings.relations === 'string'
      ? [settings.relations]
      : [];
  }

  setPrimaryKey(primaryKey) {
    this.primaryKey = primaryKey;
  }

  addRelation1N(relation) {
    if (typeof relation !== 'object') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error`,
        relation
      );
    }
    if (typeof relation.localKey !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing localKey`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing localKey`,
        relation
      );
    }
    if (typeof relation.foreignTable !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param : Missing foreignTable`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param : Missing foreignTable`,
        relation
      );
    }
    if (typeof relation.localKeyInForeignTable !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param : Missing localKeyInForeignTable`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param : Missing localKeyInForeignTable`,
        relation
      );
    }
    this.relations.push({
      type: '1:N',
      localKey: relation.localKey,
      foreignTable: relation.foreignTable,
      localKeyInForeignTable: relation.localKeyInForeignTable,
      primaryKeyInForeignTable: relation.primaryKeyInForeignTable || 'id',
    });
  }

  addRelationNM(relation) {
    if (typeof relation !== 'object') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error`,
        relation
      );
    }
    if (typeof relation.relTable !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing relTable`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing relTable`,
        relation
      );
    }
    if (typeof relation.localKeyInRelTable !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing localKeyInRelTable`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing localKeyInRelTable`,
        relation
      );
    }
    if (typeof relation.foreignKeyInRelTable !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing foreignKeyInRelTable`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing foreignKeyInRelTable`,
        relation
      );
    }
    if (typeof relation.foreignTable !== 'string') {
      console.error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing foreignTable`,
        relation
      );
      throw new Error(
        `pgPort.addRelation for ${this.domain} has a param error: Missing foreignTable`,
        relation
      );
    }

    this.relations.push({
      type: 'N:M',
      localKey: relation.localKey || this.primaryKey,
      relTable: relation.relTable,
      localKeyInRelTable: relation.localKeyInRelTable,
      foreignKeyInRelTable: relation.foreignKeyInRelTable,
      foreignTable: relation.foreignTable,
      primaryKeyInForeignTable: relation.primaryKeyInForeignTable || 'id',
    });
  }

  async getConn() {
    if (!PgCrud.__pool__) {
      PgCrud.__pool__ = new Pool({
        connectionString: this.connectionString,
      });
      const conn = await PgCrud.__pool__.connect();
      const versionRS = await conn.query('SELECT version()');

      if (versionRS && versionRS.length > 0) {
        console.log(versionRS.at(0).version);
      }
      await conn.release();
    }

    const conn = await PgCrud.__pool__.connect();
    return conn;
  }

  async get(condition) {
    if (!condition) {
      return null;
    }

    let result;
    if (Number.isInteger(condition) && condition > 0) {
      result = await this.read({ [this.primaryKey]: condition });
    } else if (typeof condition === 'string') {
      // #TODO: check unique and string fields
      result = await this.read({ name: condition });
    } else if (
      typeof condition !== 'object' ||
      Object.keys(condition).length === 0
    ) {
      throw new Error('Error with params');
    } else {
      // #TODO: check unique fields
      const [field, value] = Object.entries(condition).at(0);

      result = await this.read({ [field]: value });
    }

    return result.length === 1 ? result : null;
  }

  async read(readConditions = {}) {
    const db = await this.getConn();
    let resultSet;

    let [fields, conditions, joins, values, groupByFields] = [
      [],
      [],
      [],
      [],
      [],
    ];

    fields = ['*'];

    [fields, conditions, joins, values] = Object.entries(readConditions).reduce(
      ([fields, conditions, joins, values], [field, value], idx) => [
        /*fields:*/ fields,
        /*conditions:*/ [...conditions, `"${field}" = $${1 + idx}`],
        /*joins:*/ joins,
        /*values:*/ [...values, value],
      ],
      [fields, conditions, joins, values]
    );

    if (this.relations.length > 0) {
      fields = fields.map((field) => `${this.domain}.${field}`);

      [fields, conditions, joins, values] = this.relations.reduce(
        ([fields, conditions, joins, values], relation, idx) =>
          relation.type === 'N:M'
            ? [
                /*fields:*/ [
                  ...fields,
                  `array_agg(${relation.relTable}.${relation.foreignKeyInRelTable}) AS ${relation.foreignTable}`,
                ],
                /*conditions:*/ conditions,
                /*joins:*/ [
                  ...joins,
                  `LEFT JOIN ${relation.relTable} ON (${this.domain}.${relation.localKey} = ${relation.relTable}.${relation.localKeyInRelTable})`,
                ],
                /*values:*/ values,
              ]
            : [
                /*fields:*/ [
                  ...fields,
                  `array_agg(${relation.foreignTable}.${relation.primaryKeyInForeignTable}) AS ${relation.foreignTable}`,
                ],
                /*conditions:*/ conditions,
                /*joins:*/ [
                  ...joins,
                  `LEFT JOIN ${relation.foreignTable} ON (${this.domain}.${relation.localKey} = ${relation.foreignTable}.${relation.localKeyInForeignTable})`,
                ],
                /*values:*/ values,
              ],
        [fields, conditions, joins, values]
      );
      groupByFields = [`${this.domain}.${this.primaryKey}`];
    }

    const queryStmt = `
        SELECT ${fields.join(', ')}
          FROM ${this.domain}
            ${joins.length === 0 ? '' : joins.join('\n')}
          ${conditions.length === 0 ? '' : ' WHERE ' + conditions.join(' AND ')}
          ${
            groupByFields.length === 0
              ? ''
              : 'GROUP BY ' + groupByFields.join(', ')
          }`;

    resultSet = await db.query(queryStmt, values);

    await db.release();

    return resultSet.rows.map((it) => {
      this.relations.forEach((relation) => {
        if (
          Array.isArray(it[relation.foreignTable]) &&
          it[relation.foreignTable].length === 1 &&
          it[relation.foreignTable].at(0) === null
        ) {
          it[relation.foreignTable] = [];
        }
      });
      return it;
    });
  }

  async create(item) {
    if (!item || typeof item !== 'object') {
      throw new Error('Error in param');
    }

    const db = await this.getConn();

    const queryParams = Object.entries(item).reduce(
      (queryParams, [field, value], idx) => ({
        fields: [...queryParams.fields, `"${field}"`],
        params: [...queryParams.params, `$${1 + idx}`],
        values: [...queryParams.values, value],
      }),
      { fields: [], params: [], values: [] }
    );

    const insertStmt = `INSERT INTO ${this.domain} (${queryParams.fields.join(
      ', '
    )}) VALUES (${queryParams.params.join(', ')}) RETURNING *`;
    const resultSet = await db.query(insertStmt, queryParams.values);

    await db.release();
    if (resultSet.rowCount === 1) {
      return resultSet.rows.at(0);
    } else {
      throw new Error(
        'Not inserted\n' +
          insertStmt +
          '\n' +
          JSON.stringify(resultSet, null, 2)
      );
    }
  }

  async update(condition, item) {
    //throw new Error('Method update not implemented.');

    if (!condition) {
      return null;
    }

    const db = await this.getConn();

    let fieldCond;
    let valueCond;

    if (Number.isInteger(condition) && condition > 0) {
      fieldCond = 'id';
      valueCond = condition;
    } else if (typeof condition === 'string') {
      // #TODO: check unique and string fields
      fieldCond = 'name';
      valueCond = condition;
    } else if (
      typeof condition !== 'object' ||
      Object.keys(condition).length === 0
    ) {
      throw new Error('Error with params');
    } else {
      // #TODO: check unique fields
      const [field, value] = Object.entries(condition).at(0);
      fieldCond = field;
      valueCond = value;
    }

    if (!fieldCond || !valueCond) {
      throw new Error('Error with params');
    }

    if (item.created_at) {
      delete item.created_at;
    }
    if (item.created_by) {
      delete item.created_by;
    }

    const updateParams = Object.entries(item)
      .filter(([field, value]) => field !== fieldCond)
      .reduce(
        (updateParams, [field, value], idx) => ({
          fields: [...updateParams.fields, `"${field}" = $${1 + idx}`],
          values: [...updateParams.values, value],
        }),
        { fields: [], values: [] }
      );

    const updateStmt = `
      UPDATE ${this.domain}
        SET ${updateParams.fields.join(', ')}
        WHERE ${fieldCond} = $${1 + updateParams.values.length}
        RETURNING *`;

    const resultSet = await db.query(updateStmt, [
      ...updateParams.values,
      valueCond,
    ]);

    await db.release();
    if (resultSet.rowCount === 1) {
      return resultSet.rows.at(0);
    } else {
      throw new Error(
        'Not updated\n' +
          +updateStmt +
          '\n' +
          JSON.stringify(resultSet, null, 2)
      );
    }
  }

  async del(condition) {
    if (!condition) {
      throw new Error('Error with params');
    }

    if (!Number.isInteger(condition) || condition <= 0) {
      // #TODO: check  string ids
      throw new Error('Error with params');
    }

    const db = await this.getConn();
    const deleteStmt = `DELETE FROM ${this.domain} WHERE id=$1 RETURNING *`;
    const resultSet = await db.query(deleteStmt, [condition]);

    await db.release();

    if (resultSet.rowCount === 1) {
      return resultSet.rows.at(0);
    } else {
      throw new Error(
        'Not deleted\n' + deleteStmt + '\n' + JSON.stringify(resultSet, null, 2)
      );
    }
  }

  setDataDomain(settings) {
    if (typeof settings !== 'object') {
      throw new Error('Missing config');
    }
    if (typeof settings.domain !== 'string') {
      throw new Error('Missing domain name');
    }

    this.domain = settings.domain;
  }
}

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
}
