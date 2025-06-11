import { Client, Pool } from 'pg';

// #TODO: Implement JOIN

export default class PgCrud {
  static __pool__ = null;
  static __conn__ = null;

  constructor(settings) {
    if (typeof settings !== 'object') {
      throw new Error('Missing config');
    }
    if (typeof settings.connectionString !== 'string') {
      throw new Error('Missing Database URL');
    }

    this.connectionString = settings.connectionString;
    this.domain = settings.domain;
  }

  async getConn() {
    if (!PgCrud.__conn__) {
      if (this.connectionString.includes('localhost')) {
        PgCrud.__conn__ = new Client({
          connectionString: this.connectionString,
        });
        await PgCrud.__conn__.connect();
        PgCrud.__conn__.close = async () => {
          await PgCrud.__conn__.end();
          PgCrud.__conn__ = null;
        };
      } else {
        if (!PgCrud.__pool__) {
          PgCrud.__pool__ = new Pool({
            connectionString: this.connectionString,
          });
        }
        PgCrud.__conn__ = await PgCrud.__pool__.connect();
        PgCrud.__conn__.close = async () => {
          await PgCrud.__conn__.release();
          PgCrud.__conn__ = null;
        };
      }

      const versionRS = await PgCrud.__conn__.query('SELECT version()');

      if (versionRS && versionRS.length > 0) {
        console.log(versionRS.at(0).version);
      }
    }

    return PgCrud.__conn__;
  }

  async get(condition) {
    if (!condition) {
      return null;
    }

    const db = await this.getConn();
    let resultSet;
    if (Number.isInteger(condition) && condition > 0) {
      resultSet = await db.query(`SELECT * FROM ${this.domain} WHERE id=$1`, [
        condition,
      ]);
    } else if (typeof condition === 'string') {
      // #TODO: check unique and string fields
      resultSet = await db.query(`SELECT * FROM ${this.domain} WHERE name=$1`, [
        condition,
      ]);
    } else if (
      typeof condition !== 'object' ||
      Object.keys(condition).length === 0
    ) {
      throw new Error('Error with params');
    } else {
      // #TODO: check unique fields
      const [field, value] = Object.entries(condition).at(0);

      resultSet = await db.query(
        `SELECT * FROM ${this.domain} WHERE ${field}=$1`,
        [value]
      );
    }
    await db.close();

    return resultSet.rows.length === 1 ? resultSet.rows : null;
  }

  async read(condition) {
    const db = await this.getConn();
    let resultSet;
    if (!condition || typeof condition !== 'object') {
      resultSet = await db.query(`SELECT * FROM ${this.domain}`);
    } else {
      const queryParams = Object.entries(condition).reduce(
        (queryParams, [field, value], idx) => ({
          conditions: [...queryParams.conditions, `${field} = $${1 + idx}`],
          values: [...queryParams.values, value],
        }),
        { conditions: [], values: [] }
      );

      resultSet = await db.query(
        `SELECT * FROM ${this.domain} WHERE ${queryParams.conditions.join(
          ' AND '
        )}`,
        queryParams.values
      );
    }

    await db.close();

    return resultSet.rows;
  }

  async create(item) {
    if (!item || typeof item !== 'object') {
      throw new Error('Error in param');
    }

    const db = await this.getConn();

    const queryParams = Object.entries(item).reduce(
      (queryParams, [field, value], idx) => ({
        fields: [...queryParams.fields, field],
        params: [...queryParams.params, `$${1 + idx}`],
        values: [...queryParams.values, value],
      }),
      { fields: [], params: [], values: [] }
    );

    const insertStmt = `INSERT INTO ${this.domain} (${queryParams.fields.join(
      ', '
    )}) VALUES (${queryParams.params.join(', ')}) RETURNING *`;
    const resultSet = await db.query(insertStmt, queryParams.values);

    await db.close();
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

    const updateParams = Object.entries(item).reduce(
      (updateParams, [field, value], idx) =>
        field === fieldCond
          ? updateParams
          : {
              fields: [...updateParams.fields, `${field} = $${1 + idx}`],
              values: [...updateParams.values, value],
            },
      { fields: [], params: [], values: [] }
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

    await db.close();
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

    await db.close();

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
