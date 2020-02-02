import React, { useState, useEffect } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default function Main() {
  const [inputError, setInputError] = useState(false);
  const [repository, setRepository] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Load repositories from localStorage on component first load.
   */
  useEffect(() => {
    const repos = localStorage.getItem('repositories');

    if (repos) {
      setRepositories(JSON.parse(repos));
    }
  }, []);

  /**
   * Set repositories on localStorage when repositories was updated.
   */
  useEffect(() => {
    localStorage.setItem('repositories', JSON.stringify(repositories));
  }, [repositories]);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const repoExists = repositories.find(repo => repo.name === repository);

      if (repoExists) {
        throw new Error('Repository already exists');
      }

      const response = await api.get(`/repos/${repository}`);

      const data = {
        name: response.data.full_name,
      };

      setRepositories([...repositories, data]);
    } catch (error) {
      setInputError(true);
    }

    setRepository('');
    setLoading(false);
  }

  function handleChangeRepository(e) {
    setInputError(false);
    setRepository(e.target.value);
  }

  return (
    <Container>
      <h1>
        <FaGithubAlt />
        Repositories
      </h1>
      <Form onSubmit={handleSubmit} inputError={inputError ? 1 : 0}>
        <input
          onChange={handleChangeRepository}
          value={repository}
          type="text"
          placeholder="Add repository"
        />
        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color="#fff" size={14} />
          ) : (
            <FaPlus color="#fff" size={14} />
          )}
        </SubmitButton>
      </Form>

      {repositories.length > 0 && (
        <List>
          {repositories.map(repo => (
            <li key={repo.name}>
              {repo.name}
              <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      )}
    </Container>
  );
}
