/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize
      .query('CREATE INDEX name_platform_idx ON Games (name COLLATE NOCASE, platform);');

    await queryInterface.addIndex(
      'Games',
      ['platform'],
      { name: 'platform_idx' },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Games', 'name_platform_idx');
    await queryInterface.removeIndex('Games', 'platform_idx');
  },
};
