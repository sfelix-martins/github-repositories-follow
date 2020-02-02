import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';
import { Loading, Owner, IssueList, Pagination } from './styles';

export default function Repository({ match }) {
  const issueStates = [
    {
      name: 'all',
      label: 'All',
    },
    {
      name: 'open',
      label: 'Open',
    },
    {
      name: 'closed',
      label: 'Closed',
    },
  ];

  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState([]);
  const [issueStateFilter, setIssueStateFilter] = useState('open');
  const [issuePage, setIssuePage] = useState(1);

  useEffect(() => {
    async function loadRepository() {
      const repoFullName = decodeURIComponent(match.params.repository);

      const [repoResponse, issuesResponse] = await Promise.all([
        api.get(`/repos/${repoFullName}`),
        api.get(`/repos/${repoFullName}/issues`, {
          params: {
            state: issueStateFilter,
            per_page: 5,
            page: issuePage,
          },
        }),
      ]);

      setRepository(repoResponse.data);
      setIssues(issuesResponse.data);
      setLoading(false);
    }

    loadRepository();
  }, [issueStateFilter, issuePage, match.params.repository]);

  function handleSelectIssueFilter(e) {
    setIssueStateFilter(e.target.value);
    setIssuePage(1);
  }

  function handleClickPrevious() {
    if (issuePage > 1) {
      setIssuePage(issuePage - 1);
    }
  }

  function handleClickNext() {
    setIssuePage(issuePage + 1);
  }

  if (loading) {
    return <Loading>Carregando...</Loading>;
  }

  if (!loading) {
    return (
      <Container>
        <Owner>
          <Link to="/">Back</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <>
            <select value={issueStateFilter} onChange={handleSelectIssueFilter}>
              {issueStates.map(state => (
                <option key={state.name} value={state.name}>
                  {state.label}
                </option>
              ))}
            </select>
            {issues.map(issue => (
              <li key={String(issue.id)}>
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <a href={issue.html_url}>{issue.title}</a>
                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </strong>
                  <p>{issue.user.login}</p>
                </div>
              </li>
            ))}
          </>
          <Pagination>
            <button
              disabled={issuePage === 1}
              onClick={handleClickPrevious}
              type="button"
            >
              Previous
            </button>
            <span>Current page: {issuePage}</span>
            <button onClick={handleClickNext} type="button">
              Next
            </button>
          </Pagination>
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
