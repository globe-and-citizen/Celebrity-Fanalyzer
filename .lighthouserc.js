module.exports = {
  ci: {
    collect: {
      startServerCommand: 'serve -s build -l 9200',
      url: ['http://localhost:9200/'],
      numberOfRuns: 3
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }]
      }
    }
  }
}
