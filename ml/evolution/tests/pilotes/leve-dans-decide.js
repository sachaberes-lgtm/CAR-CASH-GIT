/* pilote d'essai (tests/courses.test.js, d) : chaque decision leve (une erreur du cerveau : repetable, la course reste mesuree, comme dans noter.js) */
module.exports={nom:'leve',decide:function(v,m){throw new Error('decision cassee expres');}};
