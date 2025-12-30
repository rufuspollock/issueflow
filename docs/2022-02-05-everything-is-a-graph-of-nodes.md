# Everything is a graph of nodes

Everything is a graph of nodes! That is the basic abstraction we should use.

* Node = the atomic object(s) e.g. notes, documents, tasks etc
* Links = relationships between those objects. In note-taking these are relationships created by links created in notes (hypertext like ...)

![[Drawing 2022-02-05 18.53.41.excalidraw|200]]

### Why is this abstraction interesting?

* Example 1: An interesting thing is the various layers of graphs and the graphs of graphs i.e. when we make graphs into nodes at the next level up ...
  * Ex A: tags on the base graph: let's imagine we have our node graph in a pkm e.g. obsidian with markdown files (or even blocks) or roam networked blocks etc ...
    * tags are one way of selecting a subgraph
      ![[Drawing 2022-02-05 20.10.20.excalidraw]]
    * And ... we can then imagine linking those tag subgraphs (e.g. this tag relates to that tag)
  * Ex B: Or, another example which would be tasks: we can select tasks related to e.g. a "project" and then imagine projects nesting within each other or relating to each other (that's the project graph layer)  
* Example 2: it helps us frame break a bit e.g. we can see task management systems and knowledge management systems (e.g. zettelkasten) as being fundamentally similar (even identical).
  * On the frame-breaking point we can notice that task management systems don't really represent this graph aspect at all: it is all about tasks, lists of them, workflow and discovery (in rough order). What the graph brings is clarity on nesting of tasks and the fact that a) we can have arbitrary levels (rather than the project => task => checklist) b) one needn't even have the tree structure, e.g. tasks could be shared across projects. If we really adopted the graph model we'd have a much more flexible, clean and, most importantly, suitable model for modelling tasks and their interdepencies ...
    * That last point is key: the major missing point in most task systems is task relationship (and dependency) -- which if handled at all seems like an afterthought.
    * Dependency is so important because it is crucial to "scaling" and esp to integrating across projects ... (this is the whole connection with linking issue trees). If you are doing a small project a small checklist is fine ... but as you get bigger ... that's where you really need some way to nest tasks etc ...
* Example 3: we can use graph analysis and visualization tools and techniques on our tasks
  * Show me the "central" task
  * Show we an autonomous mini subgraph (i.e. a project/product completable on its own)
  * Is there a DAG structure (which implies where i can start)
  * Show how me a problem on task X will
* Example 4: easier to breakdown and breakup problems (suddenly easier to nest tasks)

On top of the generic graph of nodes/blocks, what matters for a given system, say, task management, is that there are certain specific features e.g.

* A node is a task.
* Tasks have workflow status (this is probably common across whole system and could be thought of as tags if you want)
* Tasks have comments 👈 this is important
  * And comments have threads, i.e. comments can be responses to other comments
* Tasks have an owner
* Tasks have a resolution and resolution info/material ... plus perhaps material that resolves them 👈 this is *really* important
  * This is potentially intermixed with comments 🤔
  * This is also potentially intermixed with workflow status (you could think of resolution as one form )


Aside/Reference: Notion blog post about everything being a block with children (and a unique parent)

* Every block has a type
* Every block has a default set of properties *and* these properties are preserved when you change type
* Every block has a title
* (ordered) Tree structure of node ownership
* UX features
  * indent is semantic => something becomes a child of something else
